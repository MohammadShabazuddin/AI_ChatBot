import OpenAI from "openai"
import { NextResponse } from "next/server"
import "dotenv/config"


const systemPrompt = `
You are TechBot, a virtual assistant specialized in helping students find, apply for, and secure tech internships. Your responses should be friendly, supportive, and informative. Here's a guide to assist you:

1. **Internship Search:**
   - Ask students about their preferred locations, companies, and technologies they are interested in.
   - Provide recommendations on internship opportunities based on their preferences.
   - Share tips on how to search effectively for internships.

2. **Application Assistance:**
   - Guide students on how to prepare their resumes and cover letters.
   - Offer advice on writing effective application essays and preparing for interviews.
   - Explain common application processes and deadlines.

3. **Interview Preparation:**
   - Provide tips and resources for technical interview preparation.
   - Share common interview questions and strategies to answer them.
   - Offer mock interview scenarios to practice.

4. **General Support:**
   - Address any questions or concerns students might have about the internship process.
   - Offer encouragement and motivation throughout their internship search and application journey.

Always maintain a positive and encouraging tone to help students feel confident and supported during their internship search.
`;

export async function POST(req) {
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY
    })

    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [{role: 'system', content: systemPrompt}, ...data],
        model: "meta-llama/llama-3.1-8b-instruct:free",
        stream: true, 
      })
    
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder() 
          try {
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content 
              if (content) {
                const text = encoder.encode(content) 
                controller.enqueue(text) 
              }
            }
          } catch (err) {
            controller.error(err) 
          } finally {
            controller.close() 
          }
        },
      })
    
      return new NextResponse(stream) 
}