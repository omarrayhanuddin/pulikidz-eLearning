import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import axios from '../api'; // Your axios instance
import { useAuth } from '../auth/AuthContext';

function convertHttpToWs(url) {
    try {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol;

        if (protocol === 'http:') {
            parsedUrl.protocol = 'ws:';
        } else if (protocol === 'https:') {
            parsedUrl.protocol = 'wss:';
        }

        return parsedUrl.toString();

    } catch (error) {
        console.error("Invalid URL:", url, error);
        return 'ws://127.0.0.1:8000';
    }
}

const LiveChat = ({ courseId }) => {
    const { user } = useAuth();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
    const wsUrl = convertHttpToWs(baseUrl);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/api/chat/rooms/${courseId}/messages/`);
                setMessages(response.data.results);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

        const token = localStorage.getItem('token');
        console.log(wsUrl);
        
        const ws = new WebSocket(`${wsUrl}ws/chat/${token}/`);

        ws.onopen = () => console.log('WebSocket connected');
        ws.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            setMessages((prev) => [...prev, newMessage]);
            scrollToBottom();
        };
        ws.onclose = () => console.log('WebSocket disconnected');

        setSocket(ws);

        return () => ws.close();
    }, [courseId]);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const sendMessage = () => {
        if (message.trim() && socket) {
            const msgData = { message, course_id: courseId };
            socket.send(JSON.stringify(msgData));
            setMessage('');
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto', p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
            <Typography variant="h6">Live Chat</Typography>
            <Box ref={chatContainerRef} sx={{ maxHeight: 300, overflowY: 'auto', p: 1 }}>
                <List>
                    {messages.map((msg) => (
                        <ListItem key={msg.id} sx={{ background: msg.sender.email === user.email ? '#DCF8C6' : '#EAEAEA', borderRadius: 2, mb: 1 }}>
                            <ListItemText
                                primary={msg.message}
                                secondary={`${msg.sender.name} • ${formatTimestamp(msg.timestamp)}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
            <Box sx={{ display: 'flex', mt: 2 }}>
                <TextField
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && message.trim() !== "") {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />
                <Button onClick={sendMessage} variant="contained" sx={{ ml: 1 }}>Send</Button>
            </Box>
        </Box>
    );
};

export default LiveChat;
