"use client"
import React, { useRef, useState, useEffect, useMemo } from 'react'
import Webcam from 'react-webcam'
import { FiBookOpen, FiCamera, FiRefreshCw } from "react-icons/fi";
import { analyzeAction } from '@/action/analyzeAction';

function usePortrait() {
    const [portrait, setPortrait] = useState(false);
    useEffect(() => {
        const screenMedia = window.matchMedia("(orientation: portrait)")
        const onChange = () => setPortrait(screenMedia.matches)
        onChange()
        screenMedia.addEventListener?.("change", onChange);
        return () => screenMedia.removeEventListener?.("change", onChange)
    }, [])
    return portrait
}

const cleanUpHTML = (html) =>
    String(html ?? "")
    .replace(/\bundefined\b\s*$/i, "")
    .replace(/<\/section>\s*undefined\s*$/i, "</section>");

function Camera() {
    const webcamRef = useRef(null)
    const resultRef = useRef(null)
    const canvasRef = useRef(null)
    const ridRef = useRef("")
    const ridInputRef = useRef(null);

    const [state, formAction] = React.useActionState(analyzeAction, {
        ok: false,
        html: "",
        rid: ""
    });

    const [photoDataUrl, setPhotoDataUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [responseHtml, setResponseHtml] = useState("");

    const isPortrait = usePortrait();

    const videoConstraints = useMemo(() => ({
        facingMode: "user",
        width: { ideal: isPortrait ? 480 : 640 }, // Resolusi ideal diturunkan
        height: { ideal: isPortrait ? 640 : 480 },
    }), [isPortrait]);

    function capturePhoto() {
        setErrorMessage("");
        const video = webcamRef.current?.video;
        const canvas = canvasRef.current;

        if (!video || !canvas || !video.videoWidth) {
            setErrorMessage("Kamera belum siap!");
            return;
        }

        // OPTIMASI: Kecilkan ukuran canvas agar string base64 tidak raksasa
        const targetW = isPortrait ? 480 : 640;
        const targetH = isPortrait ? 640 : 480;
        
        canvas.width = targetW;
        canvas.height = targetH;

        const context = canvas.getContext("2d");
        // Draw simpel untuk performa
        context.drawImage(video, 0, 0, targetW, targetH);

        // Kualitas diturunkan ke 0.5 (File jadi ringan banget tapi AI tetap bisa baca)
        const result = canvas.toDataURL("image/jpeg", 0.5);
        setPhotoDataUrl(result);
    }

    function retake() {
        setPhotoDataUrl("");
        setResponseHtml("");
        setIsLoading(false);
        setErrorMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function onSubmit(e) {
        if (!photoDataUrl) {
            e.preventDefault();
            setErrorMessage("Ambil foto dulu!");
            return;
        }
        const rid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        ridRef.current = rid;
        if (ridInputRef.current) ridInputRef.current.value = rid;

        setIsLoading(true);
        setErrorMessage("");
    }

    // Pantau hasil dari Server Action
    useEffect(() => {
        if (state?.rid && String(state.rid) === ridRef.current) {
            setIsLoading(false);
            if (state.ok) {
                setResponseHtml(state.html);
                setTimeout(() => {
                    resultRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            } else {
                setErrorMessage(state.html || "Gagal memproses.");
            }
        }
    }, [state]);

    return (
        <div className="max-w-md mx-auto p-4">
            <div className='relative w-full rounded-2xl overflow-hidden bg-black shadow-xl'>
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    videoConstraints={videoConstraints}
                    className={`w-full ${isPortrait ? "aspect-[3/4]" : "aspect-video"} object-cover`}
                    mirrored
                    screenshotFormat='image/jpeg'
                />

                {photoDataUrl && (
                    <img src={photoDataUrl} alt='capture' className='absolute inset-0 w-full h-full object-cover' />
                )}

                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
                    {!photoDataUrl ? (
                        <button onClick={capturePhoto} className='p-4 rounded-full bg-white text-gray-900 shadow-lg'>
                            <FiCamera size={24} />
                        </button>
                    ) : (
                        <button onClick={retake} className='p-4 rounded-full bg-white text-gray-900 shadow-lg'>
                            <FiRefreshCw size={24} />
                        </button>
                    )}

                    <form action={formAction} onSubmit={onSubmit}>
                        <input type='hidden' name='image' value={photoDataUrl} />
                        <input ref={ridInputRef} type='hidden' name='rid' />
                        <button
                            type='submit'
                            disabled={!photoDataUrl || isLoading}
                            className={`px-6 h-14 rounded-full font-bold text-white shadow-lg transition ${
                                !photoDataUrl || isLoading ? "bg-gray-500" : "bg-emerald-600"
                            }`}
                        >
                            {isLoading ? "Menganalisis..." : "Lihat Prediksi"}
                        </button>
                    </form>
                </div>
            </div>

            {errorMessage && <p className='text-red-500 mt-4 text-center'>{errorMessage}</p>}
            <canvas ref={canvasRef} className='hidden' />

            <section ref={resultRef} className='mt-8 min-h-[200px]'>
                <div className='bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-800 text-gray-100'>
                    <div className='flex items-center gap-2 mb-4 text-xl text-yellow-500 font-bold'>
                        <FiBookOpen /> Hasil Analisis AI
                    </div>

                    {isLoading ? (
                        <div className='flex gap-2 py-4'>
                            <div className='w-3 h-3 bg-yellow-500 rounded-full animate-bounce' />
                            <div className='w-3 h-3 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.2s]' />
                            <div className='w-3 h-3 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.4s]' />
                        </div>
                    ) : responseHtml ? (
                        <div 
                            className='prose prose-invert max-w-none 
                            [&_h2]:text-lg [&_h2]:text-yellow-400 [&_h2]:mt-4
                            [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1'
                            dangerouslySetInnerHTML={{ __html: cleanUpHTML(responseHtml) }} 
                        />
                    ) : (
                        <p className='text-gray-400 italic'>Silakan ambil foto untuk melihat prediksi karier, jodoh, dan kepribadianmu.</p>
                    )}
                </div>
            </section>
        </div>
    )
}

export default Camera;