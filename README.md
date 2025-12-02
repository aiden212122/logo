# ZenLogo AI

A specialized AI Logo Generator for the Spa, Foot Bath, and Wellness industry, powered by Google Gemini 3 Pro.

## Features

- **Industry Analysis**: Automatically extracts visual symbols (Lotus, Bamboo, etc.) based on service descriptions.
- **Style Customization**: Supports New Chinese, Traditional, Luxury, Modern, Thai, and Japanese Zen styles.
- **AI Generation**: Generates 2K resolution vector-style logos.
- **Refinement**: Allows prompt editing and image-to-image refinement.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run local server:
   ```bash
   npm run dev
   ```

## Deployment on Vercel

1. Push this code to a GitHub repository.
2. Import the repository in Vercel.
3. Add the Environment Variable:
   - Key: `VITE_API_KEY`
   - Value: `Your_Google_Gemini_API_Key`
4. Deploy.
