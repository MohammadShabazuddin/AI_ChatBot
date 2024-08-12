"use client";

import { Box, Button, Stack, TextField, Switch } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import "./globals.css";

export default function Home() {
  const [theme, setTheme] = useState("dark"); // Theme state
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI assistant. My goal is to help you find and get a CS internship. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      className={theme} // Apply the theme class
      sx={{ backgroundColor: theme === "dark" ? "#121212" : "#f5f5f5" }}
    >
      <h1 className="multicolor-text">Shabbu AI</h1>
      <Switch checked={theme === "dark"} onChange={toggleTheme} />

      <Stack
        direction={"column"}
        width="100vw"
        height="100vh"
        borderRadius={8}
        p={2}
        spacing={3}
        overflow="hidden"
        sx={{
          backgroundColor: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
          color: theme === "dark" ? "#FFFFFF" : "#000000",
        }}
      >
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          sx={{
            maxHeight: "100%",
            padding: "20px",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme === "dark" ? "#555" : "#CCC",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: theme === "dark" ? "#333" : "#EEE",
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
              sx={{
                margin: "10px 0",
              }}
            >
              <Box
                bgcolor={message.role === "assistant" ? "#2D2D2D" : "#4A4A4A"}
                color="#FFFFFF"
                borderRadius={16}
                p={2}
                maxWidth="75%"
                sx={{
                  whiteSpace: "pre-line", // Preserve line breaks
                  wordWrap: "break-word", // Break long words
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={"row"} spacing={2}>
          <TextField
            label="Type your message..."
            fullWidth
            multiline
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme === "dark" ? "#1876d2" : "#000000",
                },
                "&:hover fieldset": {
                  borderColor: theme === "dark" ? "#1876d2" : "#000000",
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme === "dark" ? "#1876d2" : "#000000",
                },
              },
              "& .MuiInputLabel-root": {
                color: theme === "dark" ? "#1876d2" : "#000000",
              },
              "& .MuiInputBase-input": {
                color: theme === "dark" ? "#FFFFFF" : "#000000",
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            className="button glowing-border"
            sx={{
              fontSize: "1.5em",
              backgroundColor: theme === "dark" ? "#1976d2" : "#4A90E2",
              borderColor: "#fff",
              color: "#fff",
            }}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
