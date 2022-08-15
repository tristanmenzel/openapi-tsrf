/* eslint-disable */
export type Shape = ({
    color: 'black'
      | 'blue'
      | 'red'
  }
  & ({
      type: 'square'
      size: number
    }
    | {
      type: 'circle'
      radius: number
    }
    | {
      type: 'triangle'
      opposite: number
      adjacent: number
      hypotenuse: number
    }))
