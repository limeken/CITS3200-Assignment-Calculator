import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ModalProvider } from "./components/ModalProvider.tsx";

/** "Max, why does ModalProvider need to enclose the App?"
 *  I'm glad you asked, Mr. Programmer (probably jacob).
 *  It solves a number of problems:
 *      1. Any component at any depth can call useModal()
 *      2. Modal handlers don't need to be passed through props
 *      3. We avoid isolated modal stacks
 *      4. Modal state is not lost if a child unmounts (if we ever want to build something more complex in our modal)
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ModalProvider>
          <App />
      </ModalProvider>
  </StrictMode>,
)