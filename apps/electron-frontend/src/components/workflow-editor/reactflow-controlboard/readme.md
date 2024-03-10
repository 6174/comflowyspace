# ControlBoard 

WorkflowData will add a `ControlBoard` type property, this data structure will define how user can use normal UI Form (Not Flow based )to control the workflow

# How this work in code level

1. When user loaded the workflow , the contrlboard field is undefined
   - if user did not edit controlboard config, show all config
   - if user changed the config, only show user selected config fields
  
2. User can click edit button to change which field should be visible and the order

3. When the workflow changed
  - Create new node: 
    - control board will not auto add the node fields, user can add it by hand
  - Delete a node:
    - control board will ignore this node for control fields (will not delete it, user may adjust the node to be removed and apear)
  - Update a node's fields:
    - Control board will recognize the field by name, if the name is not in field, it will not show the field
 
# Some design consideration

1. Controlboard should consider to reuse the node fields input container react component