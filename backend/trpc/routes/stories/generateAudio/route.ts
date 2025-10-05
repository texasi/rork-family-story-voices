import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

export const generateAudioProcedure = publicProcedure
  .input(
    z.object({
      text: z.string(),
      voiceId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    if (!ELEVENLABS_API_KEY) {
      console.error("ElevenLabs API key not configured");
      return {
        success: false,
        audioUrl: null,
        error: "Audio generation not configured",
      };
    }

    try {
      const elevenLabsVoiceId = input.voiceId || "21m00Tcm4TlvDq8ikWAM";

      const response = await fetch(
        `${ELEVENLABS_API_URL}/text-to-speech/${elevenLabsVoiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: input.text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API error:", errorText);
        return {
          success: false,
          audioUrl: null,
          error: "Failed to generate audio",
        };
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString("base64");
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

      return {
        success: true,
        audioUrl,
        durationSec: 0,
      };
    } catch (error) {
      console.error("Error generating audio:", error);
      return {
        success: false,
        audioUrl: null,
        error: "Failed to generate audio",
      };
    }
  });

export default generateAudioProcedure;
