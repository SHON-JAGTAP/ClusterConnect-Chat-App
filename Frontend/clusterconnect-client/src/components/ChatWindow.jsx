
function ChatWindow({ messages }) {
  return (
    <div style={styles.container}>
      {messages.map((msg, index) => (
        <div key={index} style={styles.message}>
          <p>{msg.message}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    height: "350px",
    overflowY: "auto",
    border: "1px solid #ccc",
    padding: "10px",
    marginBottom: "10px"
  },
  message: {
    padding: "8px",
    marginBottom: "6px",
    backgroundColor: "#f1f1f1",
    borderRadius: "5px"
  }
};

export default ChatWindow;
