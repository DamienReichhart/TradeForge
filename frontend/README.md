# TradeForge Frontend

Modern React application for creating and managing cryptocurrency trading bots.

## New Bot Creation Page

The bot creation page has been redesigned with a more modular and user-friendly approach:

### Key Features

- **Step-by-step workflow**: Guided process with clear progress indicators
- **Modular components**: Each section is separated into reusable components
- **Advanced visualization**: Visual representations of indicators and conditions
- **Improved UX**: Tooltips, help text, and intuitive controls

### Component Structure

- **BotFormLayout**: Container component with stepper and layout structure
- **BasicInfoForm**: Step 1 - Enter name, description, and basic parameters
- **IndicatorSelector**: Step 2 - Add and configure technical indicators 
- **ConditionEditor**: Step 3 - Create and manage trading conditions
- **BotReview**: Step 4 - Review and submit the final configuration

### Implementation Details

All components follow modern React best practices:
- TypeScript for type safety
- Styled components for consistent styling
- Responsive design for all screen sizes
- Form validation and error handling
- Interactive UI elements with visual feedback

## Running the Application

1. Ensure you have Node.js installed (v14+ recommended)
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Build for production: `npm run build`

## Technologies Used

- React 18
- TypeScript
- Material UI
- Tailwind CSS
- Chart.js
- Axios for API communication 