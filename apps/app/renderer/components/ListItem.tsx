import React from 'react'
import Link from 'next/link'

import { User } from '../interfaces'

type Props = {
  data: User
}

const ListItem = ({ data }: Props) => (
  <Link href="/detail/[id]" as={`/detail/${data.id}`}>
    {data.id}:{data.name}
  </Link>
)

export default ListItem
