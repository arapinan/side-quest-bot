# SETUP

1. Click "Add key" in [GCP](https://console.cloud.google.com/iam-admin/serviceaccounts/details/100259775828462520861/keys?project=tldr-project-479118&supportedpurview=project,folder). The "key" is an entire json file. Store it locally on your computer, but be sure not to push it to git. In the .env file, update the GOOGLE_APPLICATION_CREDENTIALS spec to be the path to your json file.

2. To install dependencies (ensure you have Node.js downloaded first), run:
```bash
npm init -y
npm install express cors dotenv @google-cloud/vertexai
```

# HOW TO RUN

1. In one terminal, run:
```bash
node server.js
```

2. In another terminal, run and open the provided link in your browser:
```bash
cd frontend
npm install  # only need to run this the first time
npm run dev
```

# How to Generate RAPIDAPI key
1. Go to https://rapidapi.com/
2. Sign up for an account
3. In the searchapi bar, type real-time-events-search
4. Click the subscribe button at the top right
5. Copy the api key and put into your .env file
