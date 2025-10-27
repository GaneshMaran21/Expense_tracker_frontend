import React, { useEffect, useState } from "react";
import { View, Text, Appearance, useColorScheme } from "react-native";

const useIsDark = ()=>{

    const colorScheme = useColorScheme(); 
    // 'light' | 'dark' | null
      // Option 2: Event listener
    //   const [theme, setTheme] = useState(Appearance.getColorScheme());
    
    //   useEffect(() => {
    //     const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    //       setTheme(colorScheme);
    //     });
    
    //     return () => subscription.remove(); // cleanup
    //   }, []);
 console.log(colorScheme,"useIsDark or light")
 return colorScheme ==="dark" 
      
}

export default useIsDark

