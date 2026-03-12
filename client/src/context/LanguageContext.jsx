import { createContext, useContext } from 'react'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const t = (key) => key
  return (
    <LanguageContext.Provider value={{ lang: 'en', changeLang: () => {}, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)