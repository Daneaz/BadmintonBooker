module.exports = {
    apps: [{
        name: "badminton-backend",
        script: "./backend/bin/www",
        watch: true,
        env: {
            "NODE_ENV": "development",
        },
        env_production: {
            "NODE_ENV": "production"
        }
    },
    {
        name: "badminton-frontend",
        script: "./frontend/ecosystem.config.js",
        watch: true,
        env: {
            "NODE_ENV": "development",
        },
        env_production: {
            "NODE_ENV": "production"
        }
    }]
}