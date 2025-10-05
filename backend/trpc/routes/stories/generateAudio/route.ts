import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { createClient } from "@supabase/supabase-js";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
      
      const fileName = `story-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
      const filePath = `audio/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, audioBuffer, {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return {
          success: false,
          audioUrl: null,
          error: 'Failed to upload audio',
        };
      }

      const { data: urlData } = supabase.storage
        .from('stories')
        .getPublicUrl(filePath);

      return {
        success: true,
        audioUrl: urlData.publicUrl,
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
