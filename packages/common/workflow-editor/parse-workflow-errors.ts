import { ComfyUIErrorTypes, ComfyUIExecuteError, NODE_REROUTE, PersistedWorkflowDocument, SUBFLOW_WIDGET_TYPE_NAME, Widgets } from "../types";

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
        message: `Widget \`${sdnode.widget}\` not found`,
        details: `${sdnode.widget}`,
        extra_info: {
          widget: sdnode.widget
        }
      });
      flowError.node_errors[id] = error as any;
    }

    if (widget && widget.name === "LoadImage") {
      const image = sdnode.fields.image;
      if (image) {
        const options = widget.input.required.image[0] as [string];
        const parsedImage = image.split('/');
        // if parsedImage length > 1 , it is a image from temporary storage
        if (options.indexOf(image) < 0 && parsedImage.length === 1) {
          error.errors.push({
            type: ComfyUIErrorTypes.image_not_in_list,
            message: `Image ${image} not in list`,
            details: `[ ${options.join(", ")} ]`,
          });
          flowError.node_errors[id] = error;
        }
      }
    }
  });
  return flowError;
}