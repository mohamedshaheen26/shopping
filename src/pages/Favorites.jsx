import React from "react";

const Favorites = ({ favorites, deleteItemFromFavorites }) => {
  return (
    <section className='order-details pb-5'>
      <div className='container'>
        <div className='mt-4 p-4 shadow-lg rounded bg-white'>
          <h2 className='fw-bold mb-5'>
            <i className='far fa-star'></i>
            {` Favorites - ${favorites.length}`}
          </h2>
          <div className='mt-3 pb-3'>
            {favorites.length > 0 ? (
              favorites.map((item) => (
                <div
                  key={item.id}
                  className='d-flex align-items-center border-bottom gap-3 pb-2 mb-4'
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className='rounded bg-light'
                    width='124'
                    height='124'
                  />
                  <div>
                    <h5 className='fw-bold'>{item.name}</h5>
                    <p>
                      <strong>Price:</strong>{" "}
                      <span className='text-muted'>{item.price}</span>
                    </p>
                  </div>
                  <span className='d-block ms-auto m-4'>
                    <button
                      className='delete-fav'
                      onClick={() => deleteItemFromFavorites(item.id)}
                    >
                      <i className='fas fa-trash'></i>
                    </button>
                  </span>
                </div>
              ))
            ) : (
              <div className='text-center my-5'>
                <h3 className='fw-bold my-2'>No favorite items found.</h3>
                <a href='/products' className='hero-button'>
                  Start shopping!
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Favorites;
