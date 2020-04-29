const ws = new WebSocket('ws://localhost:8000');

ws.onopen = () => {
  console.log('WebSocket open');
};

ws.onmessage = (data) => {
  console.log(data);
};
