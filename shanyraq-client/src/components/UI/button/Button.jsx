import './button.scss'

export default function Button({text, onClick }) {
    return (
        <>
            <button className="custom-button" onClick={onClick} >{text}</button>
        
        
        </>
    )
}