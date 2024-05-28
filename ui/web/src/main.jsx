import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// In your main entry file (e.g., index.js or App.js)
import 'tailwindcss/tailwind.css';
import 'flowbite/dist/flowbite.css';


import { store, persistor } from "./redux/store.js";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import ThemeProvider from "./components/ThemeProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <PersistGate persistor={persistor}>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </PersistGate>
);
