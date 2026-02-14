import { gapi } from 'gapi-script';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; // Optional if using only OAuth2
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

export const initClient = (callback: () => void) => {
  gapi.load('client', () => {
    gapi.client.init({
      discoveryDocs: DISCOVERY_DOCS,
    }).then(() => {
      callback();
    }, (error: any) => {
      console.error("Error initializing GAPI client", error);
    });
  });
};

// Removed signIn/signOut as we use @react-oauth/google


export const listMessages = async (query: string, maxResults: number = 10) => {
  try {
    const response = await gapi.client.gmail.users.messages.list({
      'userId': 'me',
      'q': query,
      'maxResults': maxResults
    });
    return response.result.messages || [];
  } catch (error) {
    console.error("Error listing messages", error);
    throw error;
  }
}

export const getMessage = async (messageId: string) => {
  try {
    const response = await gapi.client.gmail.users.messages.get({
      'userId': 'me',
      'id': messageId
    });
    return response.result;
  } catch (error) {
    console.error("Error getting message", error);
    throw error;
  }
}
