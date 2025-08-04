import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const port = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware per parsare il body delle richieste JSON
app.use(express.json({ limit: '10mb' }));

// Endpoint Proxy per Gemini API
app.post('/smart-crop', async (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'Nessuna immagine fornita.' });
    }
    
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'La chiave API di Gemini non è configurata sul server.' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const base64Data = image.split(',')[1];
        const imagePart = {
            inlineData: {
                mimeType: image.substring(image.indexOf(':') + 1, image.indexOf(';')),
                data: base64Data,
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    imagePart,
                    { text: 'Analyze this profile picture. Identify the main subject (person). Provide 3 creative and optimal crop suggestions as bounding boxes. The suggestions should follow good composition rules (like rule of thirds, head room, etc.). Suggestions should have a short, descriptive name (e.g., "Primo Piano Classico", "Sorriso Amichevole", "Ritratto Centrato"). The bounding box coordinates (x, y, width, height) must be normalized between 0 and 1.' }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    x: { type: Type.NUMBER, description: "Normalized X coordinate of the top-left corner." },
                                    y: { type: Type.NUMBER, description: "Normalized Y coordinate of the top-left corner." },
                                    width: { type: Type.NUMBER, description: "Normalized width of the bounding box." },
                                    height: { type: Type.NUMBER, description: "Normalized height of the bounding box." },
                                    description: { type: Type.STRING, description: "A short, descriptive name for the crop suggestion." },
                                }
                            }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        res.json(result);

    } catch (error) {
        console.error("Errore durante la chiamata all'API di Gemini:", error);
        res.status(500).json({ error: 'Errore interno del server durante l\'analisi AI.' });
    }
});


// Serve i file statici dalla build di React
app.use(express.static(path.join(__dirname, 'dist')));

// Per qualsiasi altra richiesta, serve l'index.html (per il routing lato client di React)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server proxy in ascolto su http://localhost:${port}`);
});
