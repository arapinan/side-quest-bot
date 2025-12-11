# SETUP

1. Click "Add key" in [GCP](https://console.cloud.google.com/iam-admin/serviceaccounts/details/100259775828462520861/keys?project=tldr-project-479118&supportedpurview=project,folder). The "key" is an entire json file. Store it locally on your computer, but be sure not to push it to git. In the .env file, update the GOOGLE_APPLICATION_CREDENTIALS spec to be the path to your json file.

2. To install dependencies, run:

npm init -y
npm install express cors dotenv @google-cloud/vertexai

Ensure you have Node.js downloaded to do this.

--

# HOW TO RUN

1. In one terminal, run:

node server.js

2. In another terminal, run:

cd frontend
npm install  # only need to run this the first time
npm run dev

Open the link in your browser.