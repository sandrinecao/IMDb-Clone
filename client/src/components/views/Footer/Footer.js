import React from 'react'

function Footer() {
    return (
        <div style={{
            height: '80px', 
            display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center', 
            fontSize:'1rem'
        }}>
           <p>&copy; Copyright 2020 - By Sandrine Cao - 42 Project School using ReactJS, NodeJS, Express and MongoDB</p>
        </div>
    )
}

export default Footer
