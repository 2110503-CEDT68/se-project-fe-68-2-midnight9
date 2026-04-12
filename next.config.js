const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
    ],
  }
}