import OneHouse from "./oneHouse/OneHouse";
import { Route, Routes } from "react-router-dom";
import HouseReviews from "./Reviews/Reviews";
import CreateHouse from "./createhouse/CreateHouse";
import Houses from "./houses/Houses";

export default function House() {
    return (
        <>
            <Routes>
                
                <Route index  element={<Houses />} />
                <Route path="/create" element={<CreateHouse />} />
                <Route path="/review/:houseId" element={<HouseReviews />} />
                <Route path="/:houseId" element={<OneHouse />} />
                
            </Routes>


        
        </>
    )
}