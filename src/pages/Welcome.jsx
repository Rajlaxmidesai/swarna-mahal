
import { useNavigate } from 'react-router-dom'
import '../App.css'

export default function Welcome() {
  const navigate = useNavigate()

  
  return (
    <div className="royal-welcome">
      <div className="royal-particles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} style={{ '--i': i }}>✦</span>
        ))}
      </div>

      <div className="royal-frame">
        <p className="royal-topline">✧ A LEGACY OF BEAUTY ✧</p>

        <div className="royal-emblem">
          <div className="emblem-ring">
            <span>ॐ</span>
            <i>✧</i>
            <b>❋</b>
          </div>
        </div>

        <p className="royal-intro">NAMASTE & WELCOME TO</p>

        <h1 className="royal-brand">
          Swarna <span>Mahal</span>
        </h1>

        <div className="royal-separator">
          <span>◆</span>
        </div>

        <div className="royal-greeting">🙏</div>

        <h2 className="royal-namaste">Namaste!</h2>

        <p className="royal-hindi">
          Aapka Swarna Mahal mein hardik swagat hai
        </p>

        <p className="royal-description">
          Where Indian heritage meets timeless elegance.
          <br />
          Discover treasures made for your beautiful moments.
        </p>

        <button
          className="royal-enter-button"
          onClick={() => navigate('/', { replace: true })}
        >
          ENTER THE STORE <span>↗</span>
        </button>

        <p className="royal-footer">TRADITION · BEAUTY · ELEGANCE</p>
      </div>
    </div>
  )
}
