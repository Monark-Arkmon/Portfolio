import Hero from './Hero'
import { StarsBackground } from './components/StarsBackground'
import Dock from './components/Dock'
import './App.css'

function App() {
  return (
    <div className="App">
      {/* Universal Stars Background - covers entire site */}
      <StarsBackground
        factor={0.1}
        speed={75}
        starColor="#ffffff"
        pointerEvents={true}
      />

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <Hero />
      </section>

      {/* About Section */}
      <section id="about" className="content-section about-section">
        <div className="section-content">
          <h2>About Me</h2>
          <p>
            Lorem Ipsum XD
          </p>
          <p>
            Sample
          </p>
        </div>
      </section>
      
      {/* Fixed Dock - stays at bottom */}
      <Dock />
    </div>
  )
}

export default App
