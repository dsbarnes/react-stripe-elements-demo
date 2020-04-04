import React from 'react'
import { CardGroup, Card } from 'react-bootstrap'


const ProductCards = ({ products, handleAddToCart }) => {
  return (
    <CardGroup className='mt-4'>

      {products.map(sku => {
        // console.log(sku.product.images[0])
        return (
          <Card>
            <Card.Img variant="top" src={sku.product.images[0]} />

            <Card.Header>
              ${(sku.price / 100)
                .toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
            </Card.Header>

            <Card.Body>
              <Card.Title>{sku.product.name}</Card.Title>
              <Card.Text>{sku.product.caption}</Card.Text>
              <Card.Text>{sku.product.description}</Card.Text>
            </Card.Body>

            <Card.Footer>
              <input
                className='mr-3 mt-4'
                type='checkbox'
                onChange={(ev) => handleAddToCart(sku, ev)} />
                  Add To Cart
                </Card.Footer>
          </Card>
        )
      })}
    </CardGroup>
  )
}

export default ProductCards