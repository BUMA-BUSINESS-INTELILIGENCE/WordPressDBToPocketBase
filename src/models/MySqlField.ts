import { Ms_Pb } from "../constants/msFieldCorrespondingPbField.js";
import { PocketBaseField } from "../constants/pocketBaseField.js";

class MySqlField {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
  constructor(
    Field: string,
    Type: string,
    Null: string,
    Key: string,
    Default: string | null,
    Extra: string
  ) {
    this.Field = Field;
    this.Type = Type;
    this.Null = Null;
    this.Key = Key;
    this.Default = Default;
    this.Extra = Extra;
  }
  static fromObject(input: any): MySqlField {
    return new MySqlField(
      input.Field,
      input.Type,
      input.Null,
      input.Key,
      input.Default,
      input.Extra
    );
  }
  toPocketField(): PocketBaseField {
    let type: string = this.Type.split("(")[0];
    type = type.split(" ")[0];
    let required: boolean = false;
    if (Ms_Pb[type] != "number") {
      required = this.Null == "NO" ? true : false;
    }
    return {
      name: this.Field,
      type: Ms_Pb[type],
      required: false,
      defaultValue: this.Default ? this.Default : "",
    };
  }
}
export default MySqlField;
