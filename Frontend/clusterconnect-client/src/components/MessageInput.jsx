import { useState } from "react";

function MessageInput({ sendMessage }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    sendMessage(message);
    setMessage("");
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
        style={styles.input}
      />
      <button onClick={handleSend} style={styles.button}>
        Send
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "10px"
  },
  input: {
    flex: 1,
    padding: "8px"
  },
  button: {
    padding: "8px 12px",
    cursor: "pointer"
  }
};

export default MessageInput;
