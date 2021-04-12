# Code template

To create new bit classes a bit faster, you can use this hand crafted code template. This allows you to create a new bit class through your IDE.

## Webstorm and PHPStorm

![Code template PhpStorm](/code_template.gif)

To install the template:
1. Click on "File"
2. Click on "Settings..."
3. Open the "Editor" section
4. Click on "File and Code Templates"
5. Click on the "+" Sign to add a new Template
6. Add "Bit Class" as Name
7. Add "ts" as Extension
8. Leave "File name" empty
9. Add the following template in the Content box
10. Click on "Ok" to save your template 

```Velocity
#set($PART = "")
#set($ELEMENT_NAME = "")
#set($CLASS_NAME = "")
#if($NAME.endsWith(".js") || $NAME.endsWith(".ts"))
    #set($end = $NAME.length() - 3)
    #set($NAME = "$NAME.substring(0,$end)")
#end
#foreach($PART in $NAME.split("-"))
    #set($CLASS_NAME = "${CLASS_NAME}${PART.substring(0,1).toUpperCase()}${PART.substring(1)}")
#end
#set($CLASS_NAME = "${CLASS_NAME.substring(0,1).toUpperCase()}${CLASS_NAME.substring(1)}")
#set($PART = "")
#foreach($PART in $NAME.split("(?=\p{Upper})"))
    #set($ELEMENT_NAME = "${ELEMENT_NAME}-${PART.toLowerCase()}")
#end
#if($ELEMENT_NAME.startsWith("-"))
    #set($ELEMENT_NAME = "$ELEMENT_NAME.substring(1)")
#end
import {AbstractBit, Hot} from '@labor-digital/bits';

@Hot(module)
export class ${CLASS_NAME} extends AbstractBit
{
}
```