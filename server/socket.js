const { fetchDashboardData, fetchCountryIndices } = require('./dataFetcher');

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected');

    const sendUpdates = async () => {
      try {
        const dashboardData = await fetchDashboardData();
        const countryIndices = await fetchCountryIndices();

        socket.emit('dashboardUpdate', dashboardData);
        socket.emit('countryIndicesUpdate', countryIndices);
      } catch (err) {
        console.error('Error sending data:', err);
      }
    };

    sendUpdates();
    const interval = setInterval(sendUpdates, 10 * 1000);

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      clearInterval(interval);
    });
  });
}

module.exports = setupSocket;
