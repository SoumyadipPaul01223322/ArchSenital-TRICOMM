"use client"

import { useEffect, useRef, useState } from "react"
import { useScroll, useMotionValueEvent } from "framer-motion"

interface ScrollImageSequenceProps {
    frameCount: number
    framePrefix: string
    frameExtension: string
    folderPath: string
}

export function ScrollImageSequence({
    frameCount = 240,
    framePrefix = "ezgif-frame-",
    frameExtension = ".jpg",
    folderPath = "/bg-frames",
}: ScrollImageSequenceProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imagesRef = useRef<HTMLImageElement[]>([])
    const [loaded, setLoaded] = useState(0)

    const { scrollYProgress } = useScroll()

    // Preload images
    useEffect(() => {
        const images: HTMLImageElement[] = []
        let loadedCount = 0

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image()
            const frameNum = i.toString().padStart(3, "0")
            img.src = `${folderPath}/${framePrefix}${frameNum}${frameExtension}`
            img.onload = () => {
                loadedCount++
                setLoaded(Math.floor((loadedCount / frameCount) * 100))

                // Draw first frame as soon as it loads to prevent blank screen
                if (i === 1 && canvasRef.current) {
                    const ctx = canvasRef.current.getContext("2d")
                    if (ctx) {
                        drawFrame(ctx, canvasRef.current, img)
                    }
                }
            }
            images.push(img)
        }
        imagesRef.current = images
    }, [frameCount, framePrefix, frameExtension, folderPath])

    // Resize canvas handler
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight

            // Redraw current frame
            const currentFrameIndex = Math.min(
                frameCount - 1,
                Math.floor(scrollYProgress.get() * frameCount)
            )
            const ctx = canvas.getContext("2d")
            if (ctx && imagesRef.current[currentFrameIndex]?.complete) {
                drawFrame(ctx, canvas, imagesRef.current[currentFrameIndex])
            }
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [frameCount, scrollYProgress])

    // Function to draw image maintaining aspect ratio and covering exactly like object-fit: cover
    const drawFrame = (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        img: HTMLImageElement
    ) => {
        const canvasRatio = canvas.width / canvas.height
        const imgRatio = img.width / img.height
        let drawWidth = canvas.width
        let drawHeight = canvas.height
        let offsetX = 0
        let offsetY = 0

        if (imgRatio > canvasRatio) {
            drawWidth = canvas.height * imgRatio
            offsetX = (canvas.width - drawWidth) / 2
        } else {
            drawHeight = canvas.width / imgRatio
            offsetY = (canvas.height - drawHeight) / 2
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // Keep it vivid so bright objects draw clearly over text
        ctx.globalAlpha = 0.9
        ctx.globalCompositeOperation = "source-over"
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
    }

    // Handle scroll events
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (!canvasRef.current || imagesRef.current.length < frameCount) return

        // Calculate frame based on scroll percentage
        let frameIndex = Math.floor(latest * (frameCount - 1))

        // Ensure index is within bounds
        frameIndex = Math.max(0, Math.min(frameCount - 1, frameIndex))

        const img = imagesRef.current[frameIndex]

        if (img && img.complete) {
            const ctx = canvasRef.current.getContext("2d")
            if (ctx) {
                drawFrame(ctx, canvasRef.current, img)
            }
        }
    })

    return (
        <>
            {loaded < 100 && (
                <div className="fixed inset-0 -z-20 flex items-center justify-center bg-[#090910]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-0.5 w-48 overflow-hidden bg-[rgba(255,255,255,0.1)]">
                            <div
                                className="h-full bg-[#00e5a0] transition-all duration-300"
                                style={{ width: `${loaded}%` }}
                            />
                        </div>
                        <span className="font-mono text-xs tracking-wider text-[#6a6a7a]">
                            LOADING THEME FRAMES [{loaded}%]
                        </span>
                    </div>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-10 h-full w-full pointer-events-none mix-blend-screen opacity-70"
                style={{ filter: "brightness(0.35) contrast(1.4) saturate(1.1)" }}
            />

            {/* Cinematic Vignette Overlay to darken the edges globally */}
            <div
                className="fixed inset-0 z-10 pointer-events-none mix-blend-multiply"
                style={{
                    background: "radial-gradient(circle at center, transparent 30%, rgba(9, 9, 16, 0.85) 100%)"
                }}
            />

            {/* Scanlines overlay for cinematic texture */}
            <div
                className="fixed inset-0 z-10 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: "linear-gradient(transparent 50%, #000 50%)",
                    backgroundSize: "100% 4px"
                }}
            />

            {/* Fallback solid background strictly behind canvas */}
            <div className="fixed inset-0 -z-20 bg-[#090910]" />
        </>
    )
}
