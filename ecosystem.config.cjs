module.exports = {
  apps: [
    {
      name: "chatauditwidget",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      env: { NODE_ENV: "production" },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      time: true,
    },
  ],
};
