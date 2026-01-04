"use server"

export async function analyzeAction(prevState, formData) {
    const imageDataUrl = String(formData.get("image") || "");
    const rid = String(formData.get("rid") || "");

    if (!imageDataUrl) return { ok: false, html: "Foto tidak ditemukan." };

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    // GUNAKAN MODEL GEMINI 2.0 FLASH (Ini model tercepat saat ini)
    const model = "nvidia/nemotron-nano-12b-v2-vl:free";

    const instruction = `Analisis wajah/pose dari gambar untuk hiburan. 
    Gunakan HTML valid (section, h2, p, ul, li). 
    Nada tegas, ringkas, gunakan emoji.
    Jika tidak ada orang, balas: <p>Tidak terdeteksi orang. Coba lagi.</p>
    Struktur: Ekspresi Wajah, Prediksi (Karier, Cinta, Masa Depan, Kepribadian, Keberuntungan), Rekomendasi Cepat.`;

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: "Anda ahli fisiognomi (pembaca wajah) yang humoris. Keluarkan hanya HTML saja." },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: instruction },
                            { type: "image_url", image_url: { url: imageDataUrl } }
                        ]
                    }
                ],
                max_tokens: 800,
                temperature: 0.7
            }),
            cache: "no-store"
        });

        const data = await res.json();
        const html = data?.choices?.[0]?.message?.content || "Gagal mendapatkan respon AI.";
        return { ok: true, html, rid };
    } catch (err) {
        return { ok: false, html: "Terjadi kesalahan koneksi.", rid };
    }
}