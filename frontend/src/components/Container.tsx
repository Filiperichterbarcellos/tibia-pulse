import { PropsWithChildren } from 'react'

export default function Container({ children }: PropsWithChildren) {
  return <div className="container-pad py-6">{children}</div>
}
