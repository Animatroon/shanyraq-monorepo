import { Route, Routes } from "react-router-dom";
import OneLandlord from "./oneLandlord/OneLandlord";

export default function Landlord() {
    return (
        <>
            <Routes>
                <Route path="" />
                <Route path=":landlordId" element={<OneLandlord/>} />
            </Routes>
        
        </>
    )
}