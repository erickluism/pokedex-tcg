import './globals.css';
export const metadata={title:'Pokédex TCG',description:'Sua coleção de cartas Pokémon, organizada por Pokédex'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><header><div className="wrap"><span className="brand">◈ POKÉDEX TCG</span><nav><a href="/">Início</a> · <a href="/login">Entrar</a> · <a href="/dashboard">Minha coleção</a></nav></div></header>{children}</body></html>}
