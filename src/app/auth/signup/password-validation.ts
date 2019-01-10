
import { FormGroup } from '@angular/forms';
 
export class PasswordValidator {
    static validate(passwords: FormGroup) {
        let password = passwords.controls.password.value;
        let repeat = passwords.controls.repeat.value;
        
        if(!repeat) {
            return null;
        }

        if (repeat.length <= 0) {
            return null;
        }
 
        if (repeat !== password) {
            return {
                doesMatchPassword: true
            };
        }
        
        return null;
 
    }
}