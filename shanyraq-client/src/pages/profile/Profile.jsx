import { useNavigate } from "react-router-dom"
import useAuthStore from "../../store/auth/authStore"

export default function Profile() {
    const navigate = useNavigate()
    const { isAuth, role } = useAuthStore()


    if (!isAuth) {
        navigate('/')
    }

    if (role === 'Арендатор') {
        return (
            <>
                <div className="Profile" >
                    Аты: name
    
    
    
    
                </div>
            </>
        )

    }



    



}