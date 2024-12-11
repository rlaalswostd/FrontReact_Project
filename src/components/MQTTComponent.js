import mqtt from 'mqtt';
import React, { useEffect, useState } from 'react';

const MQTTComponent = () => {
    const [messages, setMessages] = useState([]);
    const [messageToSend, setMessageToSend] = useState('');
    const [client, setClient] = useState(null);

    // storeId를 실제 값으로 설정
    const storeId = "9";
    const topic = `bsit/class403/${storeId}`;
    const brokerUrl = 'ws://175.126.37.21:11884';

    // MQTT 연결 옵션 정의
    const options = {
        clean: true,
        reconnectPeriod: 2000,
        clientId: `react-client-${new Date().getTime()}`,
        username: 'aaa',
        password: 'bbb',
    };

    useEffect(() => {
        const mqttClient = mqtt.connect(brokerUrl, options);

        mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');
            mqttClient.subscribe(topic, (err) => {
                if (!err) {
                    console.log(`Subscribed to topic: ${topic}`);
                }
            });
        });

        mqttClient.on('message', (topic, message) => {
            console.log(`Received message: ${message.toString()} from topic: ${topic}`);
            setMessages((prev) => [...prev, { topic, message: message.toString() }]);
        });

        mqttClient.on('error', (err) => {
            console.error('MQTT error:', err);
        });

        setClient(mqttClient);

        return () => {
            mqttClient.end();
        };
    }, [topic]);

    const sendMessage = () => {
        if (client && messageToSend) {
            client.publish(topic, messageToSend, { qos: 1 }, (err) => {
                if (err) {
                    console.error('Publish error', err);
                } else {
                    console.log('Message sent successfully');
                    setMessageToSend('');
                }
            });
        }
    };

    return (
        <div>
            <h2>MQTT</h2>
            <div>
                <input
                    type="text"
                    value={messageToSend}
                    onChange={(e) => setMessageToSend(e.target.value)}
                    placeholder="Type a message to send"
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            <div>
                <h3>Received Messages:</h3>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>
                            <strong>Topic:</strong> {msg.topic} | <strong>Message:</strong> {msg.message}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MQTTComponent;