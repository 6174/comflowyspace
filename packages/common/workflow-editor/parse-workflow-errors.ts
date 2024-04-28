import { ComfyUIErrorTypes, ComfyUIExecuteError, Input, NODE_REROUTE, PersistedWorkflowDocument, SUBFLOW_WIDGET_TYPE_NAME, Widgets } from "../types";

/**
 * Utility to parse comfyui workflow errors
 * @param widgets 
 * @param doc 
 * @param error 
 */
export function staticCheckWorkflowErrors(
  widgets: Widgets,
  workflow: PersistedWorkflowDocument
): ComfyUIExecuteError {
  const flowError: ComfyUIExecuteError = {
    node_errors: {}
  }

  Object.keys(workflow.nodes).forEach(id => {
    const node = workflow.nodes[id];
    const sdnode = node.value;
    const widget = widgets[sdnode.widget];
    const error = flowError.node_errors[id] || { errors: [] };
    
    if ([NODE_REROUTE, "PrimitiveNode", SUBFLOW_WIDGET_TYPE_NAME].indexOf(sdnode.widget) >= 0) {
      return;
    }

    // clean old errors 
    error.errors = error.errors.filter(err => {
      return err.type !== ComfyUIErrorTypes.widget_not_found && err.type !== ComfyUIErrorTypes.image_not_in_list;
    });

    // check widget exist
    if (!widget) {
      error.errors.push({
        type: ComfyUIErrorTypes.widget_not_found,
        static: true,
        message: `Widget \`${sdnode.widget}\` not found`,
        details: `${sdnode.widget}`,
        extra_info: {
          widget: sdnode.widget
        }
      });
    }

    if (widget) {
      // check required fields
      const requiredFields = Object.keys(widget.input.required);
      const inputKeys = (sdnode.inputs || []).map(input => input.name);
      requiredFields.forEach(field => {
        const value = sdnode.fields[field];
        const input = widget.input.required[field];
        if (inputKeys.includes(field)) {
          return;
        }

        // Skip upload check
        if (field === "upload") {
          return
        }

        if (!value) {
          const defaultValue = ((input[1] ?? {}) as any).default;
          // check is default value exist
          if (defaultValue !== undefined) {
            return;
          }
          error.errors.push({
            type: ComfyUIErrorTypes.required_field_missing,
            static: true,
            message: `Field \`${field}\` is required`,
            details: `Field \`${field}\` is required`,
            extra_info: {
              field: field,
              widget: sdnode.widget
            }
          });
        } else {
          // Skip LoadImage check
          // if (widget.name === "LoadImage" && field === "image") {
          //   return
          // }
          if (Input.isList(input)) {
            const options = input[0];
            if (options.indexOf(value) < 0) {
              error.errors.push({
                type: ComfyUIErrorTypes.value_not_in_list,
                static: true,
                message: `Field \`${field}\` not avaliable`,
                details: `Available options: [ ${options.join(", ")} ]`,
                extra_info: {
                  field: field,
                  widget: sdnode.widget
                }
              });
            }
          }
        }
      });

    }

    if (error.errors.length > 0) {
      flowError.node_errors[id] = error as any;
    }
  });
  return flowError;
}