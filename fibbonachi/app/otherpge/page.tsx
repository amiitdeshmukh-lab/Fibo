import React from "react";

import Link from "next/link";

export default ()=>{
    return(
        <div>
            I'm on some other page!
            <Link href="/">Go back to main page</Link>
        </div>
    );
};