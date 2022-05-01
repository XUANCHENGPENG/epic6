import React from 'react'
import {Link} from 'react-router-dom'
import './Home.css'

export default function Home() {
    return (
        <div className='home-container'>
            <div className='home-header'>
                <h1 className='home-heading'>Pride Melbsports</h1>
            </div>
            <h1 className="description">Yoga Trainer</h1>
            <div className="btn-section">
                    <Link to='/start'>
                        <button
                            className="btn start-btn"
                        >Start</button>
                    </Link>
                    <Link to='/tutorials'>
                        <button
                            className="btn start-btn"
                        >Help</button>
                    </Link>
            </div>
            <div className="about-main">
                <p className="about-content">
                This project is based on the work of Harsh: an AI-based Yoga Trainer on Github, which can be accessed by <a href="https://github.com/harshbhatt7585/YogaIntelliJ">https://github.com/harshbhatt7585/YogaIntelliJ</a>
                </p>
            </div>
        </div>
    )
}
