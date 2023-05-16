/* COB-CLI START customize.frontend.style.mdPreview */
import("./lib/marked.min.js");
import("./cob/_mdPreview.js");
/* COB-CLI END customize.frontend.style.mdPreview */
/* COB-CLI START customize.frontend.style.dateDiff */
import("./cob/_dateDiff.js");
/* COB-CLI END customize.frontend.style.dateDiff */
/* COB-CLI START customize.keywords.image */
import("./cob/_image.js");
//import("./cob/_pdfPreview.js");

/* COB-CLI END customize.keywords.image */
/* COB-CLI START customize.keywords.styleResults */
import("./cob/_styleResults.js");
/* COB-CLI END customize.keywords.styleResults */
/* COB-CLI START customize.dashboard.dash */
import("./customizations/dashboard.js");
/* COB-CLI END customize.dashboard.dash */
/* COB-CLI START customize.frontend.common */
import("./cob/_show_hidden.js");
import("./cob/_disable_save_onSubdetail.js");
import("./cob/_group_references.js");
/* COB-CLI END customize.frontend.common *
//* COB-CLI START customize.keywords.calc */
import("./cob/_calc.js");
/* COB-CLI END customize.keywords.calc */
/* COB-CLI START customize.frontend.style.currency */
import("./cob/_format_currency.js");
/* COB-CLI END customize.frontend.style.currency */
/* COB-CLI START customize.keywords.kibana */
import("./cob/_kibana.js");
/* COB-CLI END customize.keywords.kibana */
/* COB-CLI START customize.keywords.audit */
import("./cob/_audit.js");
/* COB-CLI END customize.keywords.audit */

import("./lib/pdfjs/pdf.js")
import("./lib/pdfjs/pdf.sandbox.js")
import("./lib/pdfjs/pdf.worker.js")