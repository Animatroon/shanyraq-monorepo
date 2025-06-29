import './pagination.scss'
import Button from '../UI/button/Button'
import { useEffect, useState } from 'react';

export const Pagination = ({ page, handlePageChange, totalPage }) => {

  const [pages,setPages] = useState([])


  const generatePages = () => {
    const result = []
    // setPages([])

    result.push(1);

    if (page > 3) {
      result.push('...');
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPage - 1, page + 1);

    for (let i = start; i <= end; i++) {
      result.push(i);  
    }

    if (page < totalPage - 2) {
      result.push('...');
    }

    result.push(totalPage);
    return result
    
  };
  useEffect(() => {
    setPages([])
    setPages(generatePages())
    
  }, [page,totalPage])
  if (totalPage <= 1) return <></>

  return (
    
    <div className="paginat">
      {page > 1 && (
        <Button onClick={() => handlePageChange(page - 1)} text="Назад" />
      )}

      {pages.map((p, index) =>
        p === '...' ? (
          <span key={`dots-${index}`}>...</span>
        ) : (
          p === page ? (

            <Button
              key={index}
              
              onClick={() => handlePageChange(p)}
              text={p}
            />
          ):
          <Button
              key={index}
              onClick={() => handlePageChange(p)}
              text={p}
          />
        )
      )}

      {page < totalPage && (
        <Button onClick={() => handlePageChange(page + 1)} text="Далее" />
      )}
    </div>
    
  );

};
