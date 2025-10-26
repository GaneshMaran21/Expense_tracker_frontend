import React, { useEffect, useState } from "react";
import { View, Text, Appearance, useColorScheme } from "react-native";

const isDark = (color)=>{

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
 console.log(colorScheme,"isDark or light")
 return colorScheme ==="light" ? false : true
      
}

export default isDark

