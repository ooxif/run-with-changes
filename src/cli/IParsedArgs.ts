import ICheckChangesOptions from "../ICheckChangesOptions";
import IScript from "../IScript";

export default interface IParsedArgs {
  checkChangesOptions: ICheckChangesOptions;
  selector: string;
  scripts: IScript[];
}
