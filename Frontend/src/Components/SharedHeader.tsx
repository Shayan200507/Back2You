import type { ReactNode } from "react"
import logo from "../assets/back2you-logo-transparent.png"

type SharedHeaderProps = {
    children?: ReactNode
}

function SharedHeader({children}: SharedHeaderProps){

    return(
        <header className="w-full h-[50px] bg-white flex items-center justify-between">
            <div className="flex items-center ml-[8px]">
                <img src={logo} alt="" className="w-[40px]" />
                <h1 className="font-system-ui font-medium">Back2You</h1>
            </div>

            {children && <div className="flex items-center mr-[20px]">{children}</div>}
        </header>
    )

}

export default SharedHeader
