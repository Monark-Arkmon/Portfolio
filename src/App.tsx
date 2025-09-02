import Hero from './Hero'
import About from './About'
import Projects from './Projects'
import Experience from './Experience'
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
        <About />
      </section>

      {/* Experience Section */}
      <section id="experience" className="content-section experience-section">
        <Experience />
      </section>

      {/* Projects Section */}
      <section id="projects" className="content-section projects-section">
        <Projects />
      </section>
      
      {/* Sticky Dock - stays at bottom */}
      <Dock />
    </div>
  )
}

export default App
